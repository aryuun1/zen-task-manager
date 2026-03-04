import mongoose, { Document, Schema } from "mongoose";

export interface ITask extends Document {
    title: string;
    description?: string;
    status: 'pending' | 'completed';
    dueDate?: Date;
    owner: mongoose.Types.ObjectId;
    createdAt: Date;
}

const taskSchema = new Schema<ITask>({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    dueDate: {
        type: Date,
        default: Date.now
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
    { timestamps: true });


taskSchema.index({ owner: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ owner: 1, status: 1 });


export default mongoose.model<ITask>('Task', taskSchema);
