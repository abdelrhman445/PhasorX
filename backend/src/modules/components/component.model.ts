import mongoose, { Schema, Document } from 'mongoose';

export interface IComponent extends Document {
  name: string;          
  type: string;          
  pins: string[];        
  defaultParams: Record<string, any>; 
  iconUrl?: string;     
}

const ComponentSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    pins: [{ type: String, required: true }],
    defaultParams: { type: Schema.Types.Mixed, default: {} }, 
    iconUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IComponent>('Component', ComponentSchema);