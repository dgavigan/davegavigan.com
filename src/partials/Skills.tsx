import { useState } from 'react'

const Skills = () => {
  const categories = [
    {name: 'Frontend Development', subSkills: ['React', 'Angular', 'Ionic', 'React Native']},
    {name: 'Backend Development', subSkills: ['NodeJS / Express', 'Go', 'PostgreSQL', 'Cassandra', 'DynamoDB', 'MongoDB']},
    {name: 'CI/CD & Infra', subSkills: ['Docker', 'Kafka', 'JenkinsCI', 'Github Actions', 'AWS CDK', 'AWS Lamda']},
    {name: 'Apps & Tools', subSkills: ['Datadog', 'Launchdarkly', 'LogRocket']}
  ]
  const [expanded, setExpanded] = useState<boolean[]>(Array(categories.length).fill(false));

  const toggleCategory = (index: number) => {
    const newExpanded = [...expanded];
    newExpanded[index] = !newExpanded[index];
    setExpanded(newExpanded);
  };

  return (
    <div className="mb-4 w-full rounded-lg bg-white p-6 shadow-md sticky top-5 ">
    <div className="container mx-auto mt-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Skills</h2>
      </div>
      <div className="space-y-2">
        {categories.map((category, index) => (
          <div key={index} className="group">
            <button
              className="w-full text-left font-semibold text-blue-500 group-hover:text-blue-600"
              onClick={() => toggleCategory(index)}
            >
              {category.name}
              <span className="float-right">{expanded[index] ? '-' : '+'}</span>
            </button>
            <div
              className={`space-y-1 pl-4 overflow-hidden ${
                expanded[index] ? 'max-h-96' : 'max-h-0'
              } transition-max-h ease-in-out duration-300`}
            >
              {category.subSkills.map((subSkill, subIndex) => (
                <div key={subIndex}>{subSkill}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  )
}
  
  export { Skills };


  /*
      Skill Bar Chart
      <div className="space-y-2">
        <div>
          <div className="flex-grow">Frontend Development</div>
          <div className="flex items-center">
            <div className="w-4/5 bg-blue-500 h-4 rounded-lg"></div>
            <div className="ml-2 text-sm">Expert</div>
          </div>
        </div>
        <div>
          <div className="flex-grow">Backend Development</div>
          <div className="flex items-center">
            <div className="w-4/5 bg-blue-500 h-4 rounded-lg"></div>
            <div className="ml-2">Advanced</div>
          </div>
        </div>
      </div>
  */