import Link from "next/link"

export function CreateEventCTA() {
  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Create Your Own Event?
            </h3>
            <p className="text-gray-300 mb-6">
              Join thousands of event organizers who trust Ticketify for their blockchain-powered events.
            </p>
            <Link
              href="/create-event"
              className="inline-flex items-center px-8 py-4 bg-primary-gradient text-white rounded-xl bg-primary-gradient-hover transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Create Your Event
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
