## Signature
A signature pad for capturing signatures
This widget allows you to save a signature to an attribute.
The widget implements bezier curves and velocity for the smooth drawing of the signature

## Features
* Record signature in an attribute
* Customizable pen color and pen size 
* Reset button to delete signature and reset the canvas

## Configuration
Add the widget to a dataView. Connect the data URL property to an unlimited String attribute of the dataView context object.

## Demo project
[https://signature101.mxapps.io](https://signature101.mxapps.io)

## Usage

![Data source](/assets/signatureImage.gif)
- After the signature is drawn, it can either be saved automatically after a timeout of three seconds by selecting the saveOnChange option or saved using the default save button when the option for saveOnFormCommit is selected. 

### Appearance configuration
![Data source](/assets/Home.PNG)
- This is where you select the attribute which is to hold the signature string. The attribute must be an unlimited string.

![Data source](/assets/penCustomization.PNG)
- In the pen customization, this is where you can customize your own pen size, the pen color, the maximum and minimum pen width and the velocity pressure.

![Data source](/assets/appear.PNG)
- The canvas height and width can also be customized from here
- Whether to show the grid background or not, size of the x and y axis of the grid, color of the grid and the grid border size can all be customized from here.
-A client can decide to set his/her signature pad as either default to make it editable or never which makes it non editable. 
- the grid color is set from here too depending on the clients' wish.
- Grid border width is too set from this portion
- width unit has two values that is percentage or pixels
- height unit has three values, percentage of width pixels and then percentage.
- saving the drawn signature is automatic. it is either by selecting saveOnChange or save on form commit. 

![Data source](/assets/Events.PNG)
Under this section, this is where different actions are undertaken when an event for example an onClick event happens.
- When a microflow is selected, then on an onClick action is triggered, a microflow will be executed.
In the same way for the Nanoflow, onClick and it is selected, a nanoflow will be executed.
- If the client selects one of the four options that are stated under the on click section, then the selected option will be executed else, an error message will show up.
-  There is a timeout  to wait to consider when the signature is complete. Past this set time, then the signature will be automatically saved. 
- After signing either a microflow or a nanoflow is executed depending on the clients' choice. 


### Properties
* **Pen color** - HTML color code of the pen.
* **Signature timeout** - Amount of milliseconds the widget will wait after the user has stopped writing before saving the signature.
* **Canvas height** - Height of writable area in pixels.
* **Canvas width** - Width of writable area in pixels.
* **Show background grid** - When set to yes, a grid is shown in the background of the writable area.
* **Grid X** - The distance in pixels between grid lines in the horizontal direction.
* **Grid Y** - The distance in pixels between grid lines in the vertical direction.
* **Grid color** - HTML color code of the grid
* **Grid border width** - Width of canvas border in pixels
* **Data URL** - Unlimited string attribute that is used to save the signature.
* **minWidth(float)** - Minimum width of a line. Defaults to 0.5.
* **maxWidth(float)** - Maximum width of a line. Defaults to 2.5.
* **velocityFilterWeight(float)** - Weight used to modify new velocity based on the previous    velocity. Defaults to 0.7.

## Compatibility
The widget is usable and works smoothly in Google chrome. 
In Firefox by setting dom.w3c_pointer_events.enabled to “true” in about:config you can get to use the widget.(Thats if initially it was not working)
