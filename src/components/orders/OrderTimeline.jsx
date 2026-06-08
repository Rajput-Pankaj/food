import {
  LuCheck,
  LuChefHat,
  LuCircle,
  LuPackage,
  LuShoppingBag,
  LuStore,
  LuTruck,
  LuX,
} from 'react-icons/lu';
import {
  ORDER_STATUS,
  getTrackingFlow,
  getTrackingStepDescription,
  getTrackingStepLabel,
  normalizeOrderStatus,
} from '../../constants/orders';

const STEP_ICONS = {
  pending: LuShoppingBag,
  accepted: LuCheck,
  preparing: LuChefHat,
  ready: LuPackage,
  shipped: LuTruck,
  delivered: LuCheck,
  rejected: LuX,
};

function getStepState(step, currentStatus, isRejected) {
  if (isRejected) {
    if (step === ORDER_STATUS.REJECTED) return 'current';
    if (step === ORDER_STATUS.PENDING) return 'completed';
    return 'upcoming';
  }

  const flow = ['pending', 'accepted', 'preparing', 'ready', 'shipped', 'delivered'];
  const currentIndex = flow.indexOf(currentStatus);
  const stepIndex = flow.indexOf(step);

  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'current';
  return 'upcoming';
}

export default function OrderTimeline({ order, variant = 'vertical' }) {
  const currentStatus = normalizeOrderStatus(order.status);
  const isRejected = currentStatus === ORDER_STATUS.REJECTED;
  const flow = isRejected
    ? [ORDER_STATUS.PENDING, ORDER_STATUS.REJECTED]
    : getTrackingFlow(order.orderType);

  const historyMap = (order.statusHistory || []).reduce((acc, entry) => {
    const key = normalizeOrderStatus(entry.status);
    if (!acc[key]) acc[key] = entry.at;
    return acc;
  }, {});

  if (variant === 'horizontal') {
    return (
      <div className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ol className="flex items-start min-w-max gap-0 px-1">
          {flow.map((step, index) => {
            const state = getStepState(step, currentStatus, isRejected);
            const StepIcon = STEP_ICONS[step] || LuCircle;
            const isLast = index === flow.length - 1;

            return (
              <li key={step} className="flex items-start">
                <div className="flex flex-col items-center w-24 sm:w-28">
                  <span
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      state === 'completed'
                        ? 'bg-green-600 border-green-600 text-white'
                        : state === 'current'
                          ? 'bg-green-50 border-green-600 text-green-700 ring-4 ring-green-100'
                          : 'bg-white border-gray-200 text-gray-400'
                    }`}
                  >
                    {state === 'completed' ? (
                      <LuCheck className="w-4 h-4" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </span>
                  <p
                    className={`mt-2 text-[10px] sm:text-xs font-semibold text-center leading-tight ${
                      state === 'current' ? 'text-green-700' : state === 'completed' ? 'text-gray-800' : 'text-gray-400'
                    }`}
                  >
                    {getTrackingStepLabel(step, order.orderType)}
                  </p>
                  {historyMap[step] && (
                    <p className="text-[9px] text-gray-400 mt-0.5 text-center">
                      {new Date(historyMap[step]).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`w-8 sm:w-12 h-0.5 mt-5 ${
                      state === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  return (
    <ol className="space-y-0">
      {flow.map((step, index) => {
        const state = getStepState(step, currentStatus, isRejected);
        const StepIcon = STEP_ICONS[step] || LuCircle;
        const isLast = index === flow.length - 1;

        return (
          <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                className={`absolute left-[1.125rem] top-10 bottom-0 w-0.5 ${
                  state === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
            <span
              className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 ${
                state === 'completed'
                  ? 'bg-green-600 border-green-600 text-white'
                  : state === 'current'
                    ? 'bg-green-50 border-green-600 text-green-700 ring-4 ring-green-100'
                    : 'bg-white border-gray-200 text-gray-400'
              }`}
            >
              {state === 'completed' ? <LuCheck className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
            </span>
            <div className="min-w-0 pt-1">
              <p
                className={`text-sm font-semibold ${
                  state === 'current' ? 'text-green-700' : state === 'completed' ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {getTrackingStepLabel(step, order.orderType)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {getTrackingStepDescription(step, order.orderType)}
              </p>
              {historyMap[step] && (
                <p className="text-[11px] text-gray-400 mt-1">
                  {new Date(historyMap[step]).toLocaleString()}
                </p>
              )}
              {state === 'current' && step === ORDER_STATUS.READY && order.orderType === 'takeaway' && (
                <p className="text-xs text-violet-700 mt-2 inline-flex items-center gap-1 bg-violet-50 px-2 py-1 rounded-lg">
                  <LuStore className="w-3.5 h-3.5" />
                  Visit store to collect
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
