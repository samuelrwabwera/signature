import { Component, createElement } from "react";
// tslint:disable-next-line:no-submodule-imports
import * as SignaturePad from "signature_pad/dist/signature_pad.min"; // TODO: import from lib
import "../ui/Signature.scss";
import { Alert } from "./Alert";

export interface SignatureProps {
    alertMessage?: string;
    height?: number;
    heightUnit?: string;
    width?: number;
    widthUnit?: string;
    editable?: string;
    gridx?: number;
    gridy?: number;
    gridColor?: string;
    gridBorder?: number;
    penColor?: string;
    maxWidth?: string;
    minWidth?: string;
    paddingBottom?: number;
    velocityFilterWeight?: string;
    showGrid?: boolean;
    handleEvents?: VoidFunction;
    onClickAction(imageUrl?: string): void;
}

export interface SignatureState {
    isSet: boolean;
    focus: boolean;
}

export class Signature extends Component<SignatureProps, SignatureState> {
    private canvasNode: HTMLCanvasElement;
    private signaturePad: any;

    constructor(props: SignatureProps) {
        super(props);

        this.state = { isSet: false, focus: false };
    }

    render() {
        return createElement("div", {

            className: "form-control mx-textarea-input",
            style: {
                height: this.getHeight(this.props.heightUnit)
            }
        },
            createElement("canvas", {
                ref: this.getCanvas,
                resize: true,
                onMouseOver: this.editSignature,
                onClick: this.timeOut,
                // onfocusout: this.focusOption,
                // onfocus: this._onFocus,
                // onBlur: this._onBlur,
                height: this.getHeight(this.props.heightUnit),
                width: this.getWidth(this.props.widthUnit),
                style: {
                    border: this.props.gridBorder + "px solid black"
                }
            }),
            createElement("button", {
                className: "btn btn-default",
                onClick: this.resetCanvas
            }, "Reset"),
            createElement("button", {
                className: "btn btn-primary",
                onClick: () => this.getDataUrl(),
                style: { visibility: this.state.isSet ? "visible" : "hidden" }
            }, "Save"),
            createElement(Alert, { message: this.props.alertMessage || "", bootstrapStyle: "danger" })
        );
    }

    componentDidMount() {
        if (this.canvasNode) {
            this.canvasNode.style.backgroundColor = this.setbackgroundColor();
            this.signaturePad = new SignaturePad(this.canvasNode, {
                onEnd: () => { this.setState({ isSet: true }); },
                backgroundColor: this.setbackgroundColor(),
                penColor: this.props.penColor,
                velocityFilterWeight: this.props.velocityFilterWeight,
                maxWidth: this.props.maxWidth,
                minWidth: this.props.minWidth
            });
            if (this.props.showGrid) { this.drawGrid(); }
        }
    }
    private getDataUrl = () => {
        this.props.onClickAction(this.signaturePad.toDataURL());
        this.signaturePad.off();
    }

    private getCanvas = (node: HTMLCanvasElement) => {
        this.canvasNode = node;
    }

    private resetCanvas = () => {
        this.signaturePad.clear();
        this.setState({ isSet: false });
        if (this.props.showGrid) { this.drawGrid(); }
    }

    private drawGrid = () => {
        const { width, height, showGrid, gridColor, gridx, gridy } = this.props;
        if (!showGrid) return;

        let x = gridx;
        let y = gridy;
        const context = this.canvasNode.getContext("2d") as CanvasRenderingContext2D;
        context.beginPath();

        if (gridx !== 0) {
            for (; x < width; x += gridx) {
                context.moveTo(x, 0);
                context.lineTo(x, height);
            }
        }

        if (gridy !== 0) {
            for (; y < height; y += gridy) {
                context.moveTo(0, y);
                context.lineTo(width, y);
            }
        }

        context.lineWidth = 1;
        context.strokeStyle = gridColor;
        context.stroke();
    }
    // private focusOption = () => {
    //     this.canvasNode.addEventListener("focus", (event) => {
    //         event.target.style.addEventListener = "pink";
    //       }, true);
    //     this.canvasNode.addEventListener("blur", (event) => {
    //         event.target.style.background = "";
    //       }, true);
    // }

    // setting the width
    private getWidth = (type: string) => {
        if (type === "percentageOfParent") {
            return `${this.props.width}%`;
        } else if (type === "pixels") {
            return `${this.props.width}px`;
        }
    }
    // setting the height
    private getHeight = (type: string) => {
        if (type === "percentageOfParent") {
            return `${this.props.height}%`;
        } else if (type === "percentageOfWidth") {
            return `${this.props.height}%`;
        } else if (type === "pixels") {
            return `${this.props.height}px`;
        }
    }

    private editSignature = () => {
        if (this.props.editable === "never") {
            this.canvasNode.style.cursor = "not-allowed";
            this.signaturePad.off();
        }
    }

    // private _onFocus = () => {
    //     if (this.state.focus) {
    //         this.setState({
    //             focus: true
    //         });
    //         this.canvasNode.style.backgroundColor = "yellow";
    //     }
    // }

    // private _onBlur = () => {
    //     if (this.state.focus) {
    //         this.setState({
    //             focus: false
    //         });
    //     }
    // }

    private timeOut = () => {
        if (this.props.editable === "default") {
            setTimeout(this.getDataUrl, 5000);
            this.signaturePad.off();
        } else if (this.props.editable === "never") {
            this.signaturePad.off();
        }
    }

    private setbackgroundColor = () => {
        if (this.props.editable === "default") {
            return "rgba(255,255,255)"; // white
        } else {
            this.canvasNode.style.cursor = "not-allowed";
            return "rgb(238,238,238)"; // Silver
        }
    }
}
