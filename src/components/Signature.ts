import { Component, createElement } from "react";
// tslint:disable-next-line:no-submodule-imports
import * as SignaturePad from "signature_pad/dist/signature_pad.min";
import "../ui/Signature.scss";
import { Alert } from "./Alert";

export interface SignatureProps {
    alertMessage?: string;
    height?: number;
    heightUnit?: "percentageOfWidth" | "pixels" | "percentageOfParent";
    width?: number;
    widthUnit?: "percentageOfParent" | "pixels";
    editable?: "default" | "never";
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
            className: "widget-Signature signature-unset",
            style: {
                height: this.getHeight(this.props.heightUnit)
            }
        },
            createElement("canvas", {
                ref: this.getCanvas,
                resize: true,
                onMouseOver: this.editSignature,
                onFocus: this._onFocus,
                onBlur: this._onBlur,
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
            this.canvasNode.style.backgroundColor = "white";
            this.signaturePad = new SignaturePad(this.canvasNode, {
                // onFocus: this.canvasNode.style.backgroundColor = "yellow",
                // onBlur: this.canvasNode.style.backgroundColor = "",
                onEnd: () => { this.setState({ isSet: true }); },
                backgroundColor: "white",
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
        if (this.props.editable === "default") {
            this.signaturePad.on();
            setTimeout(this.getDataUrl, 5000);
        } else if (this.props.editable === "never") {
            this.signaturePad.off();
        }
    }

    private _onFocus = () => {
        if (!this.state.focus) {
            this.setState({
                focus: true
            });
            this.canvasNode.style.backgroundColor = "yellow";
        }
    }

    private _onBlur = () => {
        if (this.state.focus) {
            this.setState({
                focus: false
            });
        }
    }
}
