1. The export and import option will be available like this: Export single prompt, export project, export all projects. So, we need to properly implement the exort buttons in various places. 
   - Currently, bulk mode export does not export properly. 
   - in the editor window, export button exports all the prompts. it should export single one (current one).
   - after importing one time, the next time import does not work. after refreshing the page it works again.
   - Export-import option for templates is needed too.
2. Top bar in the browser window is missing. Add it.
3. The project browser search bar only searches the projects. it should search in these way:
   - by default it will search the names of projects and individual prompts. for each result, the type of the element in search result is shwon (is it a project? or prompt?) etc
   - user can search tags too
   - user can search within criteria. eg. searching for "horse" with "image-gen" tag, inside "Google" Project. user can add those criterias like tags.
4. Under projects, there will be a "Favourites" Project (basically a container) that shows the prompts with "Favourite" tag. user can hide/show the "Favourites" project, using the global settings icon placed in the top bar. The top bar will always have the global settings icon, regardless of what page is open. So, unified implementation will be helpful. Currently the top bar is visible in the prompt editor window. It is good. for other pages, The buttons/things in the top bar will be changed according to the current page needs. The change theme to light/dark button should also live inside the global settings.
5. Renaming UX: 
   - in prompts list under a project, there is a rename button. So, remove the ability to rename a prompt by clicking on its name. Clicking on name (or anywhere on the card except those buttons) should open the prompt.
   - in prompt editor structure panel, clicking on name lets me rename it. I dont want that. clicking on the name should expand/collapse it to the last state. For example, if user collapsed the item when only the dynamic controls are visible, clicking on the name will expand it and show onloy the dynamic controls. So, existing logic of state storing will have to be modified to utilize the last saved state, and expand/collapse based on that. The expand/collapse state also have to be stored.
6. Preview window has `Clean` and `Raw` buttons placed under the preview heading text. It should be on the right side of the heading text, and the `Preview` text should be at the left side. So the header bar has to be one line- `Preview` heading text on left, buttons on the right.
7. hovering over element in preview section will highlight the corresponding structural element in structure panel. Double clicking on the text in preview panel will put the cursor in corresponding place in the text box of structural element. if the text box was hidden, make it visible and then put the cursor in that place.
8. Google account login. user's full project will be synced to google account. It will be stored inside google account.