import { useCart } from '../hooks/useCart'

function CartBadge() {
  const { cartItems } = useCart()
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (totalItems === 0) return null

  return (
    <span className="ml-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
      {totalItems}
    </span>
  )
}

export default CartBadge
