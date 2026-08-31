import { Response } from 'express';
import Circuit from './circuit.model';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

// 1. إنشاء دائرة جديدة (Create) — ownerId بييجي من التوكن مش من الـ Body
export const createCircuit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, nodes, wires, isPublic } = req.body;
    const ownerId = req.user!.id;

    const newCircuit = new Circuit({
      title,
      ownerId,
      isPublic,
      nodes: nodes || [],
      wires: wires || [],
    });

    const savedCircuit = await newCircuit.save();
    res.status(201).json({ success: true, data: savedCircuit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء حفظ الدائرة', error: error.message });
  }
};

// 2. جلب كل دوائر المستخدم الحالي (اللي عامل تسجيل دخول)
export const getMyCircuits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user!.id;
    const circuits = await Circuit.find({ ownerId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: circuits.length, data: circuits });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء جلب الدوائر', error: error.message });
  }
};

// 3. جلب تفاصيل دائرة واحدة لفتحها في مساحة العمل (Get One)
export const getCircuitById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const circuit: any = await Circuit.findById(req.params.id).populate('ownerId', 'name email');

    if (!circuit) {
      res.status(404).json({ success: false, message: 'الدائرة غير موجودة' });
      return;
    }

    const isOwner = circuit.ownerId._id.toString() === req.user!.id;
    if (!isOwner && !circuit.isPublic) {
      res.status(403).json({ success: false, message: 'ليس لديك صلاحية الوصول لهذه الدائرة' });
      return;
    }

    res.status(200).json({ success: true, data: circuit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ في جلب بيانات الدائرة', error: error.message });
  }
};

// 4. تحديث الدائرة (Update) - لما المهندس يعدل التوصيلات ويدوس Save
export const updateCircuit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await Circuit.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'الدائرة غير موجودة' });
      return;
    }
    if (existing.ownerId.toString() !== req.user!.id) {
      res.status(403).json({ success: false, message: 'ليس لديك صلاحية تعديل هذه الدائرة' });
      return;
    }

    const { title, nodes, wires, isPublic } = req.body;

    const updatedCircuit = await Circuit.findByIdAndUpdate(
      req.params.id,
      { title, nodes, wires, isPublic },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedCircuit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء تحديث الدائرة', error: error.message });
  }
};

// 5. حذف دائرة (Delete)
export const deleteCircuit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await Circuit.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'الدائرة غير موجودة' });
      return;
    }
    if (existing.ownerId.toString() !== req.user!.id) {
      res.status(403).json({ success: false, message: 'ليس لديك صلاحية حذف هذه الدائرة' });
      return;
    }

    await Circuit.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'تم حذف الدائرة بنجاح' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء الحذف', error: error.message });
  }
};
