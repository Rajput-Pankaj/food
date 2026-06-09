import { MdCheck, MdFastfood } from 'react-icons/md';

export default function SetupLayout({ steps, currentStep, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="grid lg:grid-cols-[280px_1fr]">
          <aside className="bg-gradient-to-br from-green-600 to-green-800 text-white p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <MdFastfood className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">FoodExpress</p>
                <p className="text-green-100 text-sm">Setup wizard</p>
              </div>
            </div>

            <ol className="space-y-1">
              {steps.map((step, index) => {
                const done = index < currentStep;
                const active = index === currentStep;
                return (
                  <li
                    key={step.id}
                    className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                      active ? 'bg-white/15' : ''
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        done
                          ? 'bg-white text-green-700'
                          : active
                            ? 'bg-white/25 text-white ring-2 ring-white/40'
                            : 'bg-white/10 text-green-100'
                      }`}
                    >
                      {done ? <MdCheck className="w-4 h-4" /> : index + 1}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${active || done ? 'text-white' : 'text-green-100'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-green-100/80 mt-0.5">{step.subtitle}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="mt-8 text-xs text-green-100/70 leading-relaxed hidden sm:block">
              One-time setup. After this, the wizard is locked and you manage everything from the admin panel.
            </p>
          </aside>

          <main className="p-6 sm:p-8 lg:p-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
