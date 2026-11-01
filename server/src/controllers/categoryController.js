import Category from "../models/Category.js";
import Ticket from "../models/Ticket.js";

export async function listCategories(request, response) {
  const filter = request.user.role === "admin" ? {} : { isActive: true };
  response.json({ data: await Category.find(filter).sort({ name: 1 }) });
}

export async function createCategory(request, response) {
  const category = await Category.create(request.validated.body);
  response.status(201).json({ data: category });
}

export async function updateCategory(request, response) {
  const category = await Category.findByIdAndUpdate(
    request.params.id,
    request.validated.body,
    { new: true, runValidators: true },
  );
  if (!category)
    return response.status(404).json({ message: "Category not found." });
  response.json({ data: category });
}

export async function deleteCategory(request, response) {
  const category = await Category.findById(request.params.id);
  if (!category)
    return response.status(404).json({ message: "Category not found." });
  if (await Ticket.exists({ category: category._id })) {
    category.isActive = false;
    await category.save();
  } else {
    await category.deleteOne();
  }
  response.json({ data: { deleted: true } });
}
