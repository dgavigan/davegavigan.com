import { Section } from 'astro-boilerplate-components';

const Hero = () => (
  <Section>
    <header className="bg-white p-6 text-center">
      <div className="container mx-auto p-4">
        <img
          src="/assets/me.jpg"
          alt="Dave Gavigan"
          className="mx-auto h-24 w-24 rounded-full"
        />
        <h1 className="text-3xl font-bold">Dave Gavigan</h1>
        <p className="text-xl">Engineering Leader / Web Developer</p>
      </div>

      <div className="mx-auto w-full p-4 md:w-1/2">
        <p className="mb-2">
          Hi! My name is Dave and I’ve been a web engineer for over 10 years
          leading as both a tech lead and engineering manager for several
          others.
        </p>
        <p className="mb-2">
          My passion lies in developing other engineers and building strong
          teams through fun and competitive environments where everyone is
          challenged to grow.
        </p>
      </div>

      <div className="bg-gray-100 text-gray-800">
        <div className="z-10 w-full bg-white">
          <nav className="flex justify-center space-x-4 py-3">
            <a
              href="#resume"
              className="text-lg text-blue-600 transition  duration-300 ease-in-out hover:text-blue-800"
            >
              Resume
            </a>
            <a
              href="/portfolio/"
              className="text-lg text-blue-600 transition  duration-300 ease-in-out hover:text-blue-800"
            >
              Portfolio
            </a>
          </nav>
        </div>
      </div>
      <div className="flex justify-end space-x-4 p-4 text-lg">
        
        <a href="https://www.linkedin.com/in/davidgavigan" className="text-gray-500 hover:text-blue-500" title="LinkedIn">
            <i className="fab fa-linkedin"></i>
        </a>

        
    </div>
    </header>
  </Section>
);

export { Hero };
