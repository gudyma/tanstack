import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";

export const Route = createFileRoute("/{-$locale}/tank")({
  component: RouteComponent,
  head: ({ params }) => {
    const { locale } = params;
    const metaContent = getIntlayer("tankContent", locale);

    return {
      meta: [
        { title: metaContent.title },
        { content: metaContent.meta.description, name: "description" },
      ],
    };
  },
});

function RouteComponent() {
  const content = useIntlayer("tankContent");
  return (
    <div>
      <div>{content.title}123</div>
    </div>
  );
}
