import { CSSProperties, Component, createElement } from "react";
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
    onLoseFocus?: string;
    paddingBottom?: number;
    velocityFilterWeight?: string;
    showGrid?: boolean;
    handleEvents?: VoidFunction;
    style?: object;
    onClickAction(imageUrl?: string): void;
}

export interface SignatureState {
    isSet: boolean;
    focus: boolean;
    isGridDrawn: boolean;
}

export class Signature extends Component<SignatureProps, SignatureState> {
    private canvasNode: HTMLCanvasElement;
    private signaturePad: any;
    private width: number;
    private height: number;

    constructor(props: SignatureProps) {
        super(props);

        this.state = { isSet: false, focus: false, isGridDrawn: false };
    }

    render() {
        return createElement("div", {
            className: "widget-signature-wrapper",
            style: this.getStyle(this.props)
        },
            createElement("canvas", {
                width: this.width,
                height: this.height,
                ref: this.getCanvas,
                resize: true,
                onMouseOver: this.disableSignaturePad,
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
                onEnd: () => { this._onBlur(); this.setState({ isSet: true }); },
                backgroundColor: this.setbackgroundColor(),
                penColor: this.props.penColor,
                velocityFilterWeight: this.props.velocityFilterWeight,
                maxWidth: this.props.maxWidth,
                minWidth: this.props.minWidth
            });

            if (this.canvasNode.parentElement) {
                this.height = this.canvasNode.parentElement.clientHeight;
                this.width = this.canvasNode.parentElement.clientWidth;
            }
        }
        window.addEventListener("resize", this.resizeCanvas);
    }

    componentDidUpdate() {
        if (this.props.showGrid && !this.state.isGridDrawn) {
            this.drawGrid();
            this.setState({ isGridDrawn: true });
        }
    }

    private getDataUrl = () => {
        this.props.onClickAction(this.signaturePad.toDataURL());
    }

    private getCanvas = (node: HTMLCanvasElement) => {
        this.canvasNode = node;
    }

    private resizeCanvas = () => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);

        this.width = this.canvasNode.parentElement.offsetWidth * ratio;
        this.canvasNode.getContext("2d").scale(ratio, ratio);
        this.signaturePad.clear();
        this.setState({ isGridDrawn: false });
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
    private getStyle(props: SignatureProps): object {
        const style: CSSProperties = {
            width: props.widthUnit === "percentage" ? `${props.width}%` : `${props.width}px`
        };
        if (props.heightUnit === "percentageOfWidth") {
            style.paddingBottom = props.widthUnit === "percentage"
                ? `${props.height}%`
                : `${props.width / 2}px`;
        } else if (props.heightUnit === "pixels") {
            style.height = `${props.height}px`;
        } else if (props.heightUnit === "percentageOfParent") {
            style.height = `${props.height}%`;
        }

        return { ...style, ...this.props.style };
    }
    private disableSignaturePad = () => {
        if (this.props.editable === "never") {
            this.canvasNode.style.cursor = "not-allowed";
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
    private _onBlur = () => {
        if (this.props.onLoseFocus === "saveOnChange" && this.props.onClickAction) {
            setTimeout(this.getDataUrl, 5000);
        }
    }
}
