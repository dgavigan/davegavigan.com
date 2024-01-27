type IRecommendation = {
    author: string;
    recommendation: string;
    profile: string;
}

const Recomendation = (props: IRecommendation) => (
    <blockquote className="rounded bg-white p-4 shadow">
    <p className="italic text-gray-600">
      {props.recommendation}
    </p>
    <div className="mt-2 text-right text-sm">
      -{' '}
      <a href={`https://www.linkedin.com/in/${props.profile}/`}>
        {props.author}
      </a>
    </div>
  </blockquote>
)

export {Recomendation} 