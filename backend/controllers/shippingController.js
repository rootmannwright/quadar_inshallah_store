import { calculateShipping } from "../services/shippingService.js";

export async function calcShipping(req, res) {
    try {
        const { zip, products } = req.body;

        if (!zip || !products) {
            return res.status(400).json({ error: "CEP ou dados não fornecidos." });
        }

        const shipping = await calculateShipping(zip, products);

        return res.json(shipping);
    } catch (error) {
        console.error("Erro ao calcular o frete:", error);
        return res.status(500).json({ error: "Erro ao calcular o frete." });
    }
}