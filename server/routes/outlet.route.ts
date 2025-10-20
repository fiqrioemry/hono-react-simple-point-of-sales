import { Hono } from "hono";
import { OutletController } from "@/controllers/outlet.controller";

const outlet = new Hono();

outlet.post("", OutletController.createOutlet);
outlet.put("/:id", OutletController.updateOutlet);
outlet.get("", OutletController.getAllOutlets);
outlet.get("/:id", OutletController.getOutletById);
outlet.delete("/:id", OutletController.deleteOutlet);

export default outlet;
