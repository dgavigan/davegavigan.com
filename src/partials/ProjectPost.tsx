import type { ReactNode } from 'react';

import { ProjectMetaData } from '@/partials/ProjectMetaData';

type IProjectPostProps = {
  frontmatter: any;
  children: ReactNode;
};

const ProjectPost = (props: IProjectPostProps) => (
  <div className="container mx-auto flex flex-wrap py-6">
    <div className="flex w-full flex-col items-center px-3 md:w-2/3">
      <article className="my-4 flex flex-col shadow">
        <div className="prose prose-lg mx-auto max-w-screen-lg bg-white px-3 py-6 sm:px-6 lg:px-8">
          <div>{props.children}</div>
        </div>
      </article>
    </div>

    <aside className="flex w-full flex-col items-center px-3 md:w-1/3">
      <div className="sticky top-0 my-4 flex w-full flex-col border-b-2 border-b-blue-600 bg-white p-6 shadow ">
        <ProjectMetaData frontmatter={props.frontmatter} />
      </div>
    </aside>
  </div>
);

export { ProjectPost };
