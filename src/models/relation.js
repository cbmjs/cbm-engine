import mongoose from "mongoose";

const relationSchema = new mongoose.Schema({
	name: {
		type: String,
		unique: true,
	},
	desc: String,
	connects: [{
		start: {
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Concept",
			},
			name: String,
		},
		end: {
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Concept",
			},
			name: String,
		},
		mathRelation: String,
	}],
});

mongoose.pluralize(null);

export default mongoose.model("Relation", relationSchema);
