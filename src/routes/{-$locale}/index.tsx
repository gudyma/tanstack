import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";

export const Route = createFileRoute("/{-$locale}/")({
  component: RouteComponent,
  head: ({ params }) => {
    const { locale } = params;
    const metaContent = getIntlayer("indexContent", locale);

    return {
      meta: [
        { title: metaContent.title },
        { content: metaContent.meta.description, name: "description" },
      ],
    };
  },
});

function RouteComponent() {
  const content = useIntlayer("indexContent");
  return (
    <div>
      <div>{content.title}</div>
    </div>
  );
}
