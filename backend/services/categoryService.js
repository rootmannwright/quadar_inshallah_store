// services/categoryService.js
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import slugify from "slugify";
import mongoose from "mongoose";

const generateSlug = async (name, excludeId = null) => {
  let baseSlug = slugify(name, { lower: true, strict: true });
  let suffix = 0;
  let unique = false;
  let slug;

  while (!unique) {
    const candidate = suffix === 0 ? baseSlug : `${baseSlug}-${suffix}`;

    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };

    const exists = await Category.findOne(query);

    if (!exists) {
      slug = candidate;
      unique = true;
    } else {
      suffix++;
    }
  }

  return slug;
};

const buildTree = (categories, parentId = null) => {
  return categories
    .filter((c) =>
      parentId === null
        ? c.parent_id === null
        : String(c.parent_id) === String(parentId)
    )
    .map((c) => ({
      ...c,
      children: buildTree(categories, c._id),
    }));
};

export const getAll = async ({ flat = false } = {}) => {
  const categories = await Category.find({ is_active: true })
    .sort({ sort_order: 1, name: 1 })
    .lean();

  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const count = await Product.countDocuments({
        category_id: cat._id,
        is_active: true,
      });

      return {
        ...cat,
        product_count: count,
      };
    })
  );

  if (flat) return categoriesWithCount;
  return buildTree(categoriesWithCount);
};

export const getAllAdmin = async () => {
  const categories = await Category.find()
    .sort({ sort_order: 1, name: 1 })
    .lean();

  return Promise.all(
    categories.map(async (cat) => {
      const parent = cat.parent_id
        ? await Category.findById(cat.parent_id).lean()
        : null;

      const count = await Product.countDocuments({
        category_id: cat._id,
      });

      return {
        ...cat,
        parent_name: parent?.name || null,
        product_count: count,
      };
    })
  );
};

export const getById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: "ID inválido." };
  }

  const category = await Category.findById(id).lean();

  if (!category) {
    throw { status: 404, message: "Categoria não encontrada." };
  }

  let parent = null;
  if (category.parent_id) {
    parent = await Category.findById(category.parent_id).lean();
  }

  return {
    ...category,
    parent_name: parent?.name || null,
    parent_slug: parent?.slug || null,
  };
};

export const getBySlug = async (slug) => {
  const category = await Category.findOne({
    slug,
    is_active: true,
  }).lean();

  if (!category) {
    throw { status: 404, message: "Categoria não encontrada." };
  }

  let parent = null;
  if (category.parent_id) {
    parent = await Category.findById(category.parent_id).lean();
  }

  return {
    ...category,
    parent_name: parent?.name || null,
    parent_slug: parent?.slug || null,
  };
};

export const getProductsByCategory = async (
  slug,
  { page = 1, limit = 20, sort = "createdAt", order = "desc" } = {}
) => {
  const allowedSorts = ["name", "price", "createdAt", "stock"];
  const safeSort = allowedSorts.includes(sort) ? sort : "createdAt";

  const safeOrder = order === "asc" ? 1 : -1;

  const category = await getBySlug(slug);

  const skip = (page - 1) * limit;

  const products = await Product.find({
    category_id: category._id,
    is_active: true,
  })
    .sort({ [safeSort]: safeOrder })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Product.countDocuments({
    category_id: category._id,
    is_active: true,
  });

  return {
    category,
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const create = async ({
  name,
  description,
  parentId,
  imageUrl,
  sortOrder,
}) => {
  if (!name) {
    throw { status: 400, message: "Nome da categoria é obrigatório." };
  }

  if (parentId) {
    const parent = await Category.findById(parentId);
    if (!parent) {
      throw { status: 404, message: "Categoria pai não encontrada." };
    }
  }

  const slug = await generateSlug(name);

  const category = await Category.create({
    name: name.trim(),
    slug,
    description: description || null,
    parent_id: parentId || null,
    image_url: imageUrl || null,
    sort_order: sortOrder || 0,
    is_active: true,
  });

  return getById(category._id);
};

export const update = async (
  id,
  { name, description, parentId, imageUrl, sortOrder, isActive }
) => {
  const category = await getById(id);

  if (parentId && String(parentId) === String(id)) {
    throw {
      status: 400,
      message: "Categoria não pode ser pai de si mesma.",
    };
  }

  if (parentId) {
    const children = await Category.find({ parent_id: id });
    const childrenIds = children.map((c) => String(c._id));

    if (childrenIds.includes(String(parentId))) {
      throw {
        status: 400,
        message: "Operação criaria um ciclo de categorias.",
      };
    }
  }

  const slug =
    name && name !== category.name
      ? await generateSlug(name, id)
      : category.slug;

  await Category.findByIdAndUpdate(id, {
    name: name?.trim() ?? category.name,
    slug,
    description: description ?? category.description,
    parent_id:
      parentId !== undefined ? parentId : category.parent_id,
    image_url: imageUrl ?? category.image_url,
    sort_order: sortOrder ?? category.sort_order,
    is_active:
      isActive !== undefined ? !!isActive : category.is_active,
  });

  return getById(id);
};

export const remove = async (id) => {
  await getById(id);

  const hasProducts = await Product.exists({ category_id: id });
  if (hasProducts) {
    throw {
      status: 400,
      message: "Não é possível excluir categoria com produtos vinculados.",
    };
  }

  const hasChildren = await Category.exists({ parent_id: id });
  if (hasChildren) {
    throw {
      status: 400,
      message: "Não é possível excluir categoria com subcategorias.",
    };
  }

  await Category.findByIdAndDelete(id);

  return { message: "Categoria removida com sucesso." };
};

export const reorder = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw { status: 400, message: "Lista de itens inválida." };
  }

  const updates = items.map(({ id, sortOrder }) =>
    Category.findByIdAndUpdate(id, { sort_order: sortOrder })
  );

  await Promise.all(updates);

  return { message: "Ordem atualizada com sucesso." };
};