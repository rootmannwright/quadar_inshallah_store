// create a product cart component that will display the products that we have in our cart, with the option to remove them from the cart and then checkout. We will also include a section for the total price of the products in the cart, with a button to checkout.
import { Link } from "react-router-dom"

export default function ProductCard({ id, name, price, image }) {
  return (
    <Link to={`/product/${id}`} className="product-card">
      <img src={image} alt={name} />
      <h4>{name}</h4>
      <span>R${price}</span>
    </Link>
  )
}