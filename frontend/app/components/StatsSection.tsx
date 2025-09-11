export function StatsSection() {
  const stats = [
    {
      number: "5,000+",
      label: "Events Created",
      description: "Successful events hosted on our platform"
    },
    {
      number: "200K+",
      label: "Tickets Sold",
      description: "Secure blockchain-verified tickets"
    },
    {
      number: "35K+",
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
    <section className="py-24 bg-primary-gradient">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Trusted by the Community
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join thousands of event organizers and attendees who have chosen 
            Ticketify for their blockchain-powered events.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-xl font-semibold text-white/90 mb-2">
                  {stat.label}
                </div>
                <div className="text-white/80 text-sm">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional trust indicators */}
        <div className="mt-16 text-center">
          <p className="text-white/90 mb-8">Secured by leading blockchain protocols</p>
          <div className="flex justify-center items-center space-x-8 opacity-70">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
              <span className="text-white font-semibold">Ethereum</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
              <span className="text-white font-semibold">Somnia</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
              <span className="text-white font-semibold">IPFS</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
              <span className="text-white font-semibold">ZKVerify</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
