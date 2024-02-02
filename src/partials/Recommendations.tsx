import { Recomendation } from "./Recommendation";

const Recommendations = () => (
  <section className="bg-gray-100">
    <div className="container mx-auto px-4 py-8">
      <h2 className="mb-6 text-center text-2xl font-bold">
        What Others Say About Me
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Recomendation 
          recommendation="Dave built a great team and developed some of Extend's most impactful B2B technologies!"
          author="Lucas Gacek - Product Leader"
          profile="lucasrgacek"
        />

        <Recomendation 
          recommendation="Dave's exceptional leadership shows that it's possible to be both an outstanding manager and highly skilled engineer in one package"
          author="Bill Hefty - Software Engineer"
          profile="bill-hefty-6b973689"
        />

        <Recomendation 
          recommendation="Engineering managers are either good with people or skilled at 
          building the software solutions. Dave shows that it's possible
          to consistently do both at a high level."
          author="James Sral - Software Engineer"
          profile="james-sral"
        />

        <Recomendation 
          recommendation="Highly recommend David Gavigan in an engineering manager/leadership
          role, a great motivator and pleasure to work with 🙌"
          author="Faraz Milani - Product Leader"
          profile="farazmilani"
        />

        <Recomendation 
          recommendation="Dave is a seasoned software engineer with a remarkable blend of technical prowess, industry knowledge, and emotional intelligence."
          author="Aaron Deane - Software Engineer"
          profile="aarondeane"
        />

        {/*<Recomendation
          recommendation="I highly recommend Dave as an Engineering Leader and Developer. He consistently demonstrates strong technical ability and strong people skills that make collaboration a joy"
          author="Daniel Bernal - DevOps & SRE"
          profile="danielubernal"
        />*/}

        <Recomendation 
          recommendation="Dave makes working together easy, he is driven, considerate, and willing to work towards the best solution for everyone even when its not the easy one"
          author="Heather Nelson - Software Architect/Engineer"
          profile="hcnelson"
        />
      
      </div>
    </div>
  </section>
);

export { Recommendations };
