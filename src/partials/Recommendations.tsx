const Recommendations = () => (
  <section className="bg-gray-100">
    <div className="container mx-auto px-4 py-8">
      <h2 className="mb-6 text-center text-2xl font-bold">
        What Others Say About Me
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <blockquote className="rounded bg-white p-4 shadow">
          <p className="italic text-gray-600">
            "Dave built a great team and developed some of Extend's most
            impactful B2B technologies! "
          </p>
          <div className="mt-2 text-right text-sm">
            -{' '}
            <a href="https://www.linkedin.com/in/lucasrgacek/">
              Lucas Gacek - Product Leader
            </a>
          </div>
        </blockquote>


        <blockquote className="rounded bg-white p-4 shadow">
          <p className="italic text-gray-600">
            "Engineering managers are either good with people or skilled at 
            building the software solutions. Dave shows that it's possible
             to consistently do both at a high level. "
          </p>
          <div className="mt-2 text-right text-sm">
            -{' '}
            <a href="https://www.linkedin.com/in/james-sral/">
              James Sral - Senior Engineer
            </a>
          </div>
        </blockquote>

        <blockquote className="rounded bg-white p-4 shadow">
          <p className="italic text-gray-600">
            "Highly recommend David Gavigan in an engineering manager/leadership
            role, a great motivator and pleasure to work with 🙌 "
          </p>
          <div className="mt-2 text-right text-sm">
            -{' '}
            <a href="https://www.linkedin.com/in/farazmilani/">
              Faraz Milani - Product Leader
            </a>
          </div>
        </blockquote>

      
      </div>
    </div>
  </section>
);

export { Recommendations };
