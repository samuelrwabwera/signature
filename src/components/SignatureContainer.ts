import { Component, createElement } from "react";

import { Signature, SignatureProps } from "./Signature";

interface WrapperProps {
    mxform: mxui.lib.form._FormBase;
    mxObject?: mendix.lib.MxObject;
}

export interface SignatureContainerProps extends WrapperProps {
    dataUrl?: string;
    height?: number;
    width?: number;
    gridx?: number;
    gridy?: number;
    gridColor?: string;
    gridBorder?: number;
    saveImage: SaveImage;
    maxLineWidth?: number;
    minLineWidth?: number;
    penColor?: string;
    velocityFilterWeight?: string;
    showGrid?: boolean;
    onChangeMicroflow?: string;
}

interface SignatureContainerState {
    alertMessage: string;
    imageBlob: Blob;
    url: string;
}

export type SaveImage = "onChange" | "onFormCommit";

export default class SignatureContainer extends Component<SignatureContainerProps, SignatureContainerState> {
    private subscriptionHandles: number[] = [];
    private formHandle = 0;

    constructor(props: SignatureContainerProps) {
        super(props);

        this.state = {
            alertMessage: "",
            imageBlob: null,
            url: ""
        };

        this.updateState = this.updateState.bind(this);
        this.processEndSign = this.processEndSign.bind(this);
        this.handleValidations = this.handleValidations.bind(this);
    }

    render() {
        return createElement(Signature, {
            ...this.props as SignatureProps,
            alertMessage: this.state.alertMessage,
            onSignEnd: this.processEndSign
        });
    }

    componentWillReceiveProps(newProps: SignatureContainerProps) {
        this.resetSubscriptions(newProps.mxObject);

        this.setState({
            url: this.getAttributeValue(this.props.dataUrl, newProps.mxObject)
        });
    }

    componentWillUnmount() {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
        this.props.mxform.unlisten(this.formHandle);
    }

    private processEndSign(url: string) {
        const { mxObject, dataUrl, saveImage } = this.props;

        if (mxObject && mxObject.inheritsFrom("System.Image") && dataUrl) {
            this.convertUrltoBlob(url);
            if (saveImage === "onChange") {
                setTimeout(this.saveDocument(), 3000);
            }
        } else {
            this.setState({
                alertMessage: `${mxObject.getEntity()} does not inherit from "System.Image.`
            });
        }
    }

    private saveDocument = () => {
        const { height, mxObject, width } = this.props;

        mx.data.saveDocument(mxObject.getGuid(), this.generateFileName(),
            { width, height }, this.state.imageBlob, () => {
                mx.ui.info("Image has been saved", false);
            },
            error => {
                mx.ui.error(error.message, false);
            }
        );

        this.executeAction(this.props.onChangeMicroflow, mxObject.getGuid());
    }

    private generateFileName(): string {
        return `${Math.floor(Math.random() * 1000000)}.png`;
    }

    private getAttributeValue(attributeName: string, mxObject?: mendix.lib.MxObject): string {
        return mxObject ? mxObject.get(attributeName) as string : "";
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

            this.formHandle = this.props.mxform.listen("commit", this.saveDocument);
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
                error: (error) =>
                    window.mx.ui.error(`Error while executing microflow ${actionName}: ${error.message}`),
                params: {
                    applyto: "selection",
                    guids: [ guid ]
                }
            });
        }
    }

    private convertUrltoBlob(base64Uri: string, contentType = "image/png", sliceSize = 512) {
        const byteCharacters = atob(base64Uri.split(";base64,")[1]);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        const imageBlob = new Blob(byteArrays, { type: contentType });
        this.setState({ imageBlob });
    }
}
