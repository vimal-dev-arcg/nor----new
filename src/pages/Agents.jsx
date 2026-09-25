import Header from "../components/Header";
import Footer from "../components/Footer";
import agents from "../data/agents";

export default function Agents() {
  return (
    <>
      <Header />

      <section className="pt-32 section bg-slate-50">
        <div className="container">
          <div className="flex items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="heading-lg">Our Leadership and Senior Management Team</h1>
              <p className="text-slate-600 mt-2 max-w-2xl">
                Meet our advisory team — specialists across residential,
                commercial, and investment opportunities.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Avatar wrapper: ensures perfect circle + no cropping issues */}
                  <div className="mx-auto w-36 h-36 rounded-full overflow-hidden ring-1 ring-slate-200 bg-slate-100 shadow-inner">
                    <img
                      src={agent.photo}
                      alt={agent.name}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>

                  <h3 className="font-semibold text-lg text-slate-900 mt-5">
                    {agent.name}
                  </h3>

                  <p className="text-sm font-medium text-[#b3975b] mt-1">
                    {agent.role}
                  </p>

                  {agent.subRole && (
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {agent.subRole}
                    </p>
                  )}

                  {agent.location && (
                    <p className="text-xs text-slate-400 mt-1">
                      {agent.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}