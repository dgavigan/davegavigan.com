// Define the types for the props the component will accept
import type { MarkdownInstance } from 'astro';

import type { ProjectData } from '@/types/project';

type CardProps = {
  instance: MarkdownInstance<ProjectData>;
};
// Create the ProjectCard component with typed props
const ProjectCard: React.FC<CardProps> = (props: CardProps) => {
  return (
    <a
      className="transition duration-300 ease-in-out hover:translate-y-1"
      href={props.instance.url}
    >
      <div className="max-w-sm overflow-hidden rounded rounded-b-lg bg-white shadow-md">
        <img
          className="h-40 w-full object-cover"
          src={props.instance.frontmatter.imageSrc}
          alt={`Image for ${props.instance.frontmatter.title}`}
        />
        <div className="px-6 py-4">
          <div className="mb-2 text-xl font-bold">
            {props.instance.frontmatter.title}
          </div>
          <p className="text-base text-gray-700">
            {props.instance.frontmatter.description}
          </p>
        </div>
        <div className="px-6 pb-2 pt-4">
          <p className="mt-1 text-sm text-gray-500">
            {props.instance.frontmatter.technologies.map((tech) => (
              <span key={tech}>
                {tech}
                {', '}
              </span>
            ))}
          </p>
          <p className="mt-3 text-sm text-gray-500">
            {props.instance.frontmatter.date}
          </p>
        </div>
      </div>
    </a>
  );
};

export { ProjectCard };
