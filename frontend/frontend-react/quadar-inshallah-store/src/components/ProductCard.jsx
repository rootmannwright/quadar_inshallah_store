// create a product cart component that will display the products that we have in our cart, with the option to remove them from the cart and then checkout. We will also include a section for the total price of the products in the cart, with a button to checkout.
import { Link } from "react-router-dom"
import '../pages/productcard.css'


export default function ProductCard({ id, name, price }) {
  return (
    <Link to={`/product/${id}`} className="product-card">
      <img src="/public/images/camiseta_branca_quadar_inshallah_elipse_icon.jpg" alt={name} />
      <p className="uppercase tracking-wide">{name}</p>
      <span className="text-gray-500">R$ {price}</span>
    </Link>
  )
}