import { Action, Page } from "./PagePrimitives";
export function ChoosePathPage() { return <Page><p className="eyebrow">CHOOSE YOUR ROLE</p><h1>How will you use BlueJob?</h1><div className="form"><Action to="/setup/worker">Worker / Skilled professional</Action><Action to="/setup/contractor">Contractor / Employer</Action></div></Page>; }
