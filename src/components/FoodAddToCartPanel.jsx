import { LuMinus, LuPlus, LuShoppingBag } from 'react-icons/lu';

function QuantityStepper({ quantity, onDecrease, onIncrease, compact = false }) {
  const buttonClass = compact
    ? 'min-w-11 min-h-11 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors'
    : 'min-w-12 min-h-12 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-lg';

  const valueClass = compact
    ? 'min-w-10 px-2 text-center font-semibold text-gray-800 tabular-nums'
    : 'min-w-12 px-3 text-center font-semibold text-gray-800 tabular-nums text-lg';

  return (
    <div
      className="inline-flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden shrink-0"
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={onDecrease}
        disabled={quantity <= 1}
        className={`${buttonClass} disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Decrease quantity"
      >
        <LuMinus className="w-4 h-4" aria-hidden />
      </button>
      <span className={valueClass} aria-live="polite" aria-atomic="true">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        className={buttonClass}
        aria-label="Increase quantity"
      >
        <LuPlus className="w-4 h-4" aria-hidden />
      </button>
    </div>
  );
}

export function FoodAddToCartInline({
  quantity,
  onDecrease,
  onIncrease,
  onAddToCart,
  unitPrice,
  totalPrice,
  totalCalories,
  itemName,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Order total</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-0.5 tabular-nums">
            Rs.{totalPrice}/-
          </p>
          {totalCalories > 0 && (
            <p className="text-xs sm:text-sm text-orange-600 mt-1 tabular-nums">{totalCalories} kcal</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-500">Unit price</p>
          <p className="text-sm font-semibold text-gray-700 tabular-nums">Rs.{unitPrice}/-</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <QuantityStepper
          quantity={quantity}
          onDecrease={onDecrease}
          onIncrease={onIncrease}
        />
        <button
          type="button"
          onClick={onAddToCart}
          className="flex-1 min-h-12 inline-flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-green-700 active:bg-green-800 transition-colors shadow-lg shadow-green-600/20"
        >
          <LuShoppingBag className="w-5 h-5 shrink-0" aria-hidden />
          <span className="truncate">
            Add {quantity} to Cart
          </span>
        </button>
      </div>

      <p className="text-xs text-gray-500 sr-only sm:not-sr-only">
        Adding {quantity} × {itemName} to your cart.
      </p>
    </div>
  );
}

export function FoodAddToCartSticky({
  quantity,
  onDecrease,
  onIncrease,
  onAddToCart,
  totalPrice,
  totalCalories,
}) {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.08)] safe-area-pb">
      <div className="max-w-6xl mx-auto px-3 pt-3 pb-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="hidden min-[380px]:flex flex-col justify-center shrink-0 pr-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Total</span>
            <span className="text-base font-bold text-green-600 tabular-nums leading-tight">
              Rs.{totalPrice}/-
            </span>
            {totalCalories > 0 && (
              <span className="text-[10px] text-orange-600 tabular-nums">{totalCalories} kcal</span>
            )}
          </div>

          <QuantityStepper
            quantity={quantity}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            compact
          />

          <button
            type="button"
            onClick={onAddToCart}
            className="flex-1 min-h-11 min-w-0 inline-flex flex-col items-center justify-center gap-0.5 bg-green-600 text-white px-3 py-2.5 rounded-xl font-semibold hover:bg-green-700 active:bg-green-800 transition-colors"
          >
            <span className="inline-flex items-center gap-1.5 text-sm sm:text-base">
              <LuShoppingBag className="w-4 h-4 shrink-0" aria-hidden />
              Add to Cart
            </span>
            <span className="min-[380px]:hidden text-[11px] font-medium text-green-100 tabular-nums">
              Rs.{totalPrice}/-
              {totalCalories > 0 ? ` · ${totalCalories} kcal` : ''}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
