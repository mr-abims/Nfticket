export function StatsSection() {
  const stats = [
    {
      number: "10,000+",
      label: "Events Created",
      description: "Successful events hosted on our platform"
    },
    {
      number: "500K+",
      label: "Tickets Sold",
      description: "Secure blockchain-verified tickets"
    },
    {
      number: "50K+",
      label: "Active Users",
      description: "Community members worldwide"
    },
    {
      number: "99.9%",
      label: "Uptime",
      description: "Reliable blockchain infrastructure"
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Trusted by the Community
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Join thousands of event organizers and attendees who have chosen 
            NFTicket for their blockchain-powered events.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-xl font-semibold text-blue-100 mb-2">
                  {stat.label}
                </div>
                <div className="text-blue-200 text-sm">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional trust indicators */}
        <div className="mt-16 text-center">
          <p className="text-blue-100 mb-8">Secured by leading blockchain networks</p>
          <div className="flex justify-center items-center space-x-8 opacity-70">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
              <span className="text-white font-semibold">Ethereum</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
              <span className="text-white font-semibold">Polygon</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
              <span className="text-white font-semibold">Arbitrum</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
              <span className="text-white font-semibold">Optimism</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
