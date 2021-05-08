import mongoose from "mongoose";

const functionSchema = new mongoose.Schema({
	name: {
		type: String,
		unique: true,
	},
	desc: String,
	codeFile: {
		type: String,
		default: "default.js",
	},
	args: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Concept",
	}],
	returns: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Concept",
	}],
	argsNames: [],
	argsUnits: [],
	returnsNames: [],
	returnsUnits: [],
});

mongoose.pluralize(null);

export default mongoose.model("Function", functionSchema);
