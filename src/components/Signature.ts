import { CSSProperties, Component, createElement } from "react";
import { Alert } from "./Alert";
// tslint:disable-next-line:no-submodule-imports
import * as SignaturePad from "signature_pad/dist/signature_pad.min";
import "../ui/Signature.scss";

export interface SignatureProps {
    alertMessage?: string;
    height?: number;
    heightUnit?: "percentageOfWidth" | "pixels";
    width?: number;
    widthUnit?: "percentageOfParent" | "pixels";
    gridx?: number;
    gridy?: number;
    gridColor?: string;
    gridBorder?: number;
    penColor?: string;
    maxWidth?: string;
    minWidth?: string;
    velocityFilterWeight?: string;
    showGrid?: boolean;
    style: object;
    onClickAction(imageUrl?: string): void;
}

export interface SignatureState {
    isSet: boolean;
}

export class Signature extends Component<SignatureProps, SignatureState> {
    private canvasNode: HTMLCanvasElement;
    private signaturePad: any;

    constructor(props: SignatureProps) {
        super(props);

        this.state = { isSet: false };
    }

    render() {
        return createElement("div", {
            className: "widget-Signature signature-unset",
            style: this.getStyle()
        },
            createElement("canvas", {
                height: this.props.height,
                heightUnit: this.props.heightUnit,
                width: this.props.width,
                widthUnit: this.props.widthUnit,
                ref: this.getCanvas,
                resize: true,
                style: { border: this.props.gridBorder + "px solid black" }
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

    // function to set the height and width
    private getStyle = (): object => {
        const style: CSSProperties = {
            width: this.props.widthUnit === "percentageOfParent" ? `${this.props.width}%` : `${this.props.width}px`
        };

        this.props.heightUnit === "percentageOfWidth" ?
        style.height = `${this.props.height}%` :
        style.height = `${this.props.height}px`;

        return { ...style, ...this.props.style };
    }
}
