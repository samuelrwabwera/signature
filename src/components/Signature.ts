import { Component, createElement } from "react";
import { Alert } from "./Alert";
// tslint:disable-next-line:no-submodule-imports
import * as SignaturePad from "signature_pad/dist/signature_pad.min";
import "../ui/Signature.scss";

export interface SignatureProps {
    alertMessage?: string;
    height?: number;
    width?: number;
    gridx?: number;
    gridy?: number;
    gridColor?: string;
    gridBorder?: number;
    penColor?: string;
    maxLineWidth?: string;
    minLineWidth?: string;
    velocityFilterWeight?: string;
    showGrid?: boolean;
    onSignEnd?: (imageUrl: string) => void;
}

export class Signature extends Component<SignatureProps, {}> {
    private canvasNode: HTMLCanvasElement;
    private signaturePad: any;

    render() {
        return createElement("div", {
            className: "widget-Signature signature-unset"
        },
            createElement("canvas", {
                height: this.props.height,
                width: this.props.width,
                ref: this.getCanvas,
                resize: true,
                style: { border: this.props.gridBorder + "px solid black" }
            }),
            createElement("button", {
                className: "btn btn-default",
                onClick: this.resetCanvas
            }, "Reset"),
            createElement(Alert, { bootstrapStyle: "danger" }, this.props.alertMessage)
        );
    }

    componentDidMount() {
        if (this.canvasNode) {
            this.canvasNode.style.backgroundColor = "white";
            this.signaturePad = new SignaturePad(this.canvasNode, {
                onEnd: this.handleSignEnd,
                backgroundColor: "white",
                penColor: this.props.penColor,
                velocityFilterWeight: this.props.velocityFilterWeight,
                maxWidth: this.props.maxLineWidth,
                minWidth: this.props.minLineWidth
            });
            if (this.props.showGrid) { this.drawGrid(); }
        }
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

        for (; x < width; x += gridx) {
            context.moveTo(x, 0);
            context.lineTo(x, height);
        }

        for (; y < height; y += gridy) {
            context.moveTo(0, y);
            context.lineTo(width, y);
        }

        context.lineWidth = 1;
        context.strokeStyle = gridColor;
        context.stroke();
    }

    private handleSignEnd = () => {
        const { onSignEnd } = this.props;

        if (onSignEnd) {
            onSignEnd(this.signaturePad.toDataURL());
        }
    }
}
