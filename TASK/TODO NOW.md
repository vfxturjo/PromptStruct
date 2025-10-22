1. Star system implementation
We have to implement a star stystem in the structure editor. If an element is starrred, it will be shown in mini structured editor in the browser window.

Things that can be starred: individual dynamic controls (show a star button at the right side of each dynamic controls when hovering. if not hovering, dont show. If user clicks the star button, it lights up, and stays visible even if not hovering), or the text box (show a floating star button at the top right of each text box. if not hovering, dont show. If user clicks the star button, it lights up, and stays visible even if not hovering).

2. mini structure editor implementation:
Currently, the Direct Use Preview panel only shows the output prompt. It should show mini structure editor and the output prompt. mini structure editor will show only the starred elements, and let user edit them.
it will be a bit liting, for simplicity: user will not be able to rearragne the elements. the heading bar will be smaller, clicking will show/hide the starred thing (dynamic controls/text box, whichever starred) and there will be only on/off button. only the dynamic controls starred will be shown (toggle, slider, etc)