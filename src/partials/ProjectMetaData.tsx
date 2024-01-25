const ProjectMetaData = ({ frontmatter }: any) => (
  <>
    <div className="mb-4 text-right">
      <h3 className="text-lg font-semibold text-gray-700">
        {frontmatter.title}
      </h3>
      <p>{frontmatter.date}</p>
    </div>
    <h4 className="text-md mb-4 border-b pb-2 font-semibold text-gray-700">
      Technologies
    </h4>
    <div className="mb-4 flex flex-wrap justify-center gap-2">
      {frontmatter.technologies.map((tech: any) => (
        <span className="rounded-full bg-blue-200 px-4 py-1.5 text-sm font-semibold text-blue-700">
          {tech}
        </span>
      ))}
    </div>
  </>
);

export { ProjectMetaData };
