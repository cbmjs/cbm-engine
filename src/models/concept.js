import mongoose from "mongoose";

const conceptSchema = new mongoose.Schema({
	name: { type: String, unique: true },
	desc: String,
	units: [],
	func_arg: [{ id: { type: mongoose.Schema.Types.ObjectId, ref: "Function" }, name: String, unitType: String }],
	func_res: [{ id: { type: mongoose.Schema.Types.ObjectId, ref: "Function" }, name: String, unitType: String }],
});

mongoose.pluralize(null);

export default mongoose.model("Concept", conceptSchema);
