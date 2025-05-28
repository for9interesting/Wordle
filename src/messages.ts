export const messages = [
  "🎉你真厉害！",
  "天才呀！🎉",
  "嘿嘿，这么聪明？🎉",
  "这也能猜到？(○´･д･)ﾉ🎉",
  "( ఠൠఠ )ﾉ无敌了🎉",
  "你真棒！🎉",
  "你真聪明！🎉",
];

export function getRandomMessage() {
  return messages[Math.floor(Math.random() * messages.length)];
}

