import { boot } from "quasar/wrappers";
import { h, defineComponent, type PropType } from "vue";
import { Icon as IconifyIcon } from "@iconify/vue";

const GlobalIcon = defineComponent({
  name: "AppIcon",
  props: {
    name: { type: String as PropType<string>, required: true },
    size: { type: [Number, String] as PropType<number | string>, default: 20 },
  },
  setup(props) {
    return () =>
      h(IconifyIcon, {
        icon: props.name,
        width: props.size,
        height: props.size,
        class: "ic",
      });
  },
});

declare module "vue" {
  interface GlobalComponents {
    Icon: typeof GlobalIcon;
  }
}

export default boot(({ app }) => {
  app.component("Icon", GlobalIcon);
});
