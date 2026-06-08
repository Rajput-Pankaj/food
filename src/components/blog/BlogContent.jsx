import { parseContentBlocks } from '../../utils/blogContent';

export default function BlogContent({ content }) {
  const blocks = parseContentBlocks(content);

  return (
    <div className="blog-prose max-w-none">
      {blocks.map((block, index) => {
        if (block.type === 'h2') {
          return (
            <h2
              key={index}
              className="text-xl sm:text-2xl font-bold text-gray-900 mt-8 mb-3 first:mt-0"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === 'h3') {
          return (
            <h3 key={index} className="text-lg sm:text-xl font-semibold text-gray-800 mt-6 mb-2">
              {block.text}
            </h3>
          );
        }

        if (block.type === 'ul') {
          return (
            <ul key={index} className="my-4 space-y-2 pl-5 list-disc marker:text-green-600">
              {block.items.map((item) => (
                <li key={item} className="text-base text-gray-700 leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
