import { Component, createElement } from "react";

import { Signature } from "./Signature";

import { Alert } from "./Alert";

interface WrapperProps {
    mxObject?: mendix.lib.MxObject;
    mxform?: mxui.lib.form._FormBase;
    style?: string;
}

export interface SignatureContainerProps extends WrapperProps {
    callMicroflow?: string;
    callNanoflow?: string;
    showPage?: string;
    page?: string;
    dataUrl?: string;
    height?: number;
    heightUnit?: "percentageOfWidth" | "percentageOfParent" | "pixels";
    width?: number;
    widthUnit?: "percentage" | "pixels";
    editable?: "default" | "never";
    gridx?: number;
    gridy?: number;
    gridColor?: string;
    gridBorder?: number;
    penColor?: string;
    maxWidth?: number;
    // microflow: string;
    minWidth?: number;
    onLoseFocus?: "saveOnFormCommit" | "saveOnChange";
    velocityFilterWeight?: string;
    showGrid?: boolean;
    onClickEvent?: OnClickOptions;
    onChangeMicroflow?: string;
    onChangeNanoflow?: Nanoflow;
    openPageAs?: PageLocation;

}

interface SignatureContainerState {
    url: string;
    alertMessage: string;
}

export type OnClickOptions = "doNothing" | "showPage" | "callMicroflow" | "callNanoflow";
type PageLocation = "content"| "popup" | "modal";

interface Nanoflow {
    nanoflow: any[];
    paramsSpec: { Progress: string };
}

export default class SignatureContainer extends Component<SignatureContainerProps, SignatureContainerState> {
    signaturePad: any;
    private subscriptionHandles: number[] = [];

    constructor(props: SignatureContainerProps) {
        super(props);

        this.state = {
            url: "",
            alertMessage: SignatureContainer.validateProps(this.props)
        };

        this.updateState = this.updateState.bind(this);
        this.saveImage = this.saveImage.bind(this);
        this.handleValidations = this.handleValidations.bind(this);
    }

    render() {
        if (this.state.alertMessage) {
            return createElement(Alert, { bootstrapStyle: "danger", message: this.state.alertMessage });
        }
        return createElement(Signature, {
            ...this.props as SignatureContainerProps,
            imageUrl: this.state.url,
            onClickAction: this.saveImage,
            alertMessage: this.state.alertMessage
        } as any);
    }

    componentWillReceiveProps(newProps: SignatureContainerProps) {
        this.resetSubscriptions(newProps.mxObject);

        this.setState({
            url: this.getAttributeValue(this.props.dataUrl, newProps.mxObject)
        });
    }

    private saveImage(url: string) {
        const { mxObject, dataUrl, onChangeMicroflow } = this.props;
        if (mxObject && mxObject.inheritsFrom("System.Image") && dataUrl) {
            mx.data.saveDocument(
                mxObject.getGuid(),
                `${Math.floor(Math.random() * 1000000)}.png`,
                { width: this.props.width, height: this.props.height },
                this.base64toBlob(url),
                () => { mx.ui.info("Image has been saved", false); },
                error => { mx.ui.error(error.message, false); }
            );
            this.executeAction(onChangeMicroflow, mxObject.getGuid());
            this.executeNanoflow();
        } else {
            this.setState({ alertMessage: "The entity does not inherit from System Image" });
        }
    }

    private getAttributeValue(attributeName: string, mxObject?: mendix.lib.MxObject): string {
        return mxObject ? mxObject.get(attributeName) as string : "";
    }

    componentWillUnmount() {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
    }

    private resetSubscriptions(mxObject?: mendix.lib.MxObject) {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
        this.subscriptionHandles = [];

        if (mxObject) {
            this.subscriptionHandles.push(window.mx.data.subscribe({
                callback: this.updateState,
                guid: mxObject.getGuid()
            }));

            this.subscriptionHandles.push(mx.data.subscribe({
                attr: this.props.dataUrl,
                callback: this.updateState,
                guid: mxObject.getGuid()
            }));

            this.subscriptionHandles.push(mx.data.subscribe({
                callback: this.handleValidations,
                guid: mxObject.getGuid(),
                val: true
            }));
        }
    }

    private updateState() {
        this.setState({
            url: this.getAttributeValue(this.props.dataUrl, this.props.mxObject)
        });
    }

    private handleValidations(validations: mendix.lib.ObjectValidation[]) {
        const validationMessage = validations[0].getErrorReason(this.props.dataUrl);
        validations[0].removeAttribute(this.props.dataUrl);

        if (validationMessage) {
            this.setState({ alertMessage: validationMessage });
        }
    }

    private executeAction(actionName: string, guid: string) {
        if (actionName && guid) {
            window.mx.ui.action(actionName, {
                callback: () => this.timeOut(),
                error: (error) =>
                    window.mx.ui.error(`Error while executing microflow ${actionName}: ${error.message}`),
                params: {
                    applyto: "selection",
                    guids: [ guid ]
                }
            });
        }
    }
    private executeNanoflow() {
        const { mxform, mxObject, onChangeNanoflow } = this.props;
        const context = new window.mendix.lib.MxContext();

        context.setContext(mxObject.getEntity(), mxObject.getGuid());

        if (this.props.onClickEvent === "callNanoflow" && onChangeNanoflow.nanoflow && mxform && this.context) {
            window.mx.data.callNanoflow({
                nanoflow: onChangeNanoflow,
                origin: mxform,
                context,
                error: (error) =>
                    window.mx.ui.error(`Error while executing the nanoflow: ${error.message}`)
            });
        } else if (this.props.onClickEvent === "showPage" && this.props.page) {
            window.mx.ui.openForm(this.props.page, {
                error: error => window.mx.ui.error(`Error while opening page ${this.props.page}: ${error.message}`),
                location: this.props.openPageAs
            });
        }
    }

    private timeOut = () => {
    if (this.props.editable === "default") {
        setTimeout(this.executeAction, 5000);
        this.signaturePad.off();
    } else if (this.props.editable === "never") {
        this.signaturePad.off();
    }
}

    private static validateProps(props: SignatureContainerProps): string {
    let errorMessage = "";

    if (props.onClickEvent === "callMicroflow" && !props.onChangeMicroflow) {
        errorMessage = "A 'Microflow' is required for 'Events' 'Call a microflow'";
    } else if (props.onClickEvent === "callNanoflow" && !props.onChangeNanoflow.nanoflow) {
        errorMessage = "A 'Nanoflow' is required for 'Events' 'Call a nanoflow'";
    } else if (props.onClickEvent === "showPage" && !props.page) {
        errorMessage = "A 'Page' is required for 'Events' 'Show a page'";
    }
    if (errorMessage) {
        errorMessage = `Error in signature configuration: ${errorMessage}`;
    }
    return errorMessage;
}

    private base64toBlob(base64Uri: string): Blob {
    const byteString = atob(base64Uri.split(";base64,")[1]);
    const bufferArray = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(bufferArray);

    for (let i = 0; i < byteString.length; i++) {
        uintArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([ bufferArray ], { type: base64Uri.split(":")[0] });
}
}
