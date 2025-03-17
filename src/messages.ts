export const messages = [
  "🎉宝宝宝宝！你真厉害！我爱你！",
  "天才呀，灿宝！🎉",
  "嘿嘿，这么聪明？🎉",
  "这也能猜到？(○´･д･)ﾉ🎉",
  "( ఠൠఠ )ﾉ无敌了灿灿🎉",
  "灿灿真棒！🎉",
  "灿灿真聪明！🎉",
];

export function getRandomMessage() {
  return messages[Math.floor(Math.random() * messages.length)];
}

