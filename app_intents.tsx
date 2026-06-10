import { AppIntentManager, AppIntentProtocol, Widget } from "scripting";

/**
 * 刷新当前小组件
 */
export const RefreshIntent = AppIntentManager.register({
  name: "RefreshIntent",
  protocol: AppIntentProtocol.AppIntent,
  perform: async () => {
    Widget.reload();
  },
});

/**
 * 刷新所有小组件
 * params: 0 = reloadAll, 其他值留作扩展
 */
export const MyIntent = AppIntentManager.register({
  name: "MyIntent",
  protocol: AppIntentProtocol.AppIntent,
  perform: async (
    params: number
  ) => {
    console.log("MyIntent params:", params);
    Widget.reloadAll();
  },
});
