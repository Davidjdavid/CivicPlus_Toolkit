var javascriptToRun = prompt("Enter the code from the Color Palette:");
if (javascriptToRun != null) {
  javascriptToRun = javascriptToRun.replace("From Design Center, copy and paste into console:", "");
  eval(javascriptToRun);
}
