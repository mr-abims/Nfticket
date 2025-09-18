import Image from "next/image"

export function StatsSection() {
  const stats = [
    {
      number: "200+",
      label: "Events Created",
      description: "Successful events hosted on our platform"
    },
    {
      number: "20K+",
      label: "Tickets Sold",
      description: "Secure blockchain-verified tickets"
    },
    {
      number: "5K+",
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
    <section className="relative overflow-hidden bg-black py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-purple-600/10 dark:from-black/20 dark:to-purple-400/10"></div>
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-gradient-to-r from-black/30 to-purple-400 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20"></div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Blockchain protocols section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Secured by Leading Blockchain Protocols
          </h2>
          <div className="flex justify-center items-center space-x-8 opacity-80">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20 flex items-center space-x-3 hover:bg-white/20 transition-all duration-300">
              <Image 
                src="/Ethereum_logo.svg" 
                alt="Ethereum" 
                width={24} 
                height={24}
                className="object-contain"
                style={{ width: '24px', height: '28px' }}
              />
              <span className="text-white font-semibold">Ethereum</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
              <Image 
                src="/Somnia.svg" 
                alt="Somnia" 
                width={80} 
                height={16}
                className="object-contain"
                style={{ width: '100px', height: '30px' }}
              />
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20 flex items-center space-x-3 hover:bg-white/20 transition-all duration-300">
              <Image 
                src="/IPFS_logo.svg" 
                alt="IPFS" 
                width={24} 
                height={24}
                className="object-contain"
                style={{ width: '24px', height: '30px' }}
              />
              <span className="text-white font-semibold">IPFS</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300">
              <Image 
                src="/zkVerify-white.svg" 
                alt="zkVerify" 
                width={90} 
                height={18}
                className="object-contain"
                style={{ width: '120px', height: '30px' }}
              />
            </div>
          </div>
        </div>

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
      </div>
    </section>
  )
}
