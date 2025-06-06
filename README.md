# 星灵鲁梅拉 lumera-the-star

类型安全的《苏丹的游戏》剧情文件处理库，实现读写、数据抽象层、注释解析、双向校验功能

Type-safe parser library for _Sultan's Game_ by _Double Cross_. Provides: read/write, abstract layer, comment handling, validation for both inner data and serialized data.

## 前期开发中 In Early Development

该库仍处于早期开发阶段，请参考[开发进度](/DEVELOP.md)

## 参与开发 Participate

- 环境配置
  1. 安装依赖 `npm install --save-dev`
  2. 运行补丁 `npm run postinstall`
- 开发流程
  1. 完成开发
  2. 运行单元测试 `npx tsx --test "src/**/test/test*.ts"`
  3. ~~运行完整数据读写测试 `npm run full-test`~~暂未完成
  4. 运行 Lint `npx eslint .`
  5. 运行 Prettier
