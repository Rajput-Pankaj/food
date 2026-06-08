import { HOME_STATS } from '../../constants/home';

export default function StatsBar() {
  return (
    <section className="bg-green-600 text-white py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {HOME_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stat.value}</p>
              <p className="text-xs sm:text-sm text-green-100 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
