import { Request, Response } from 'express';
import Circuit from './circuit.model';

// 1. إنشاء دائرة جديدة (Create)
export const createCircuit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, nodes, wires, isPublic } = req.body;
    
    // في الحقيقة، الـ ownerId هييجي من الـ Auth Middleware (req.user.id)
    // بس للتجربة هنفترض إننا بنبعته في الـ Body مؤقتاً
    const ownerId = req.body.ownerId; 

    const newCircuit = new Circuit({
      title,
      ownerId,
      isPublic,
      nodes: nodes || [],
      wires: wires || []
    });

    const savedCircuit = await newCircuit.save();
    res.status(201).json({ success: true, data: savedCircuit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء حفظ الدائرة', error: error.message });
  }
};

// 2. جلب كل دوائر المستخدم (Get All for User)
export const getUserCircuits = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ownerId } = req.params; // المفروض ييجي من التوكن
    
    // هنجيب الدوائر ونرتبهم من الأحدث للأقدم
    const circuits = await Circuit.find({ ownerId }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, count: circuits.length, data: circuits });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء جلب الدوائر', error: error.message });
  }
};

// 3. جلب تفاصيل دائرة واحدة لفتحها في مساحة العمل (Get One)
export const getCircuitById = async (req: Request, res: Response): Promise<void> => {
  try {
    const circuit = await Circuit.findById(req.params.id)
                                 .populate('ownerId', 'name email'); // بنجيب اسم صاحبها

    if (!circuit) {
      res.status(404).json({ success: false, message: 'الدائرة غير موجودة' });
      return;
    }

    res.status(200).json({ success: true, data: circuit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ في جلب بيانات الدائرة', error: error.message });
  }
};

// 4. تحديث الدائرة (Update) - لما المهندس يعدل التوصيلات ويدوس Save
export const updateCircuit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, nodes, wires, isPublic } = req.body;

    const updatedCircuit = await Circuit.findByIdAndUpdate(
      req.params.id,
      { title, nodes, wires, isPublic },
      { new: true, runValidators: true } // new: true بترجع الداتا بعد التعديل
    );

    if (!updatedCircuit) {
      res.status(404).json({ success: false, message: 'الدائرة غير موجودة' });
      return;
    }

    res.status(200).json({ success: true, data: updatedCircuit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء تحديث الدائرة', error: error.message });
  }
};

// 5. حذف دائرة (Delete)
export const deleteCircuit = async (req: Request, res: Response): Promise<void> => {
  try {
    const circuit = await Circuit.findByIdAndDelete(req.params.id);

    if (!circuit) {
      res.status(404).json({ success: false, message: 'الدائرة غير موجودة' });
      return;
    }

    res.status(200).json({ success: true, message: 'تم حذف الدائرة بنجاح' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء الحذف', error: error.message });
  }
};