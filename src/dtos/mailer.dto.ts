export interface SendEmailDTO {
	toMailAddress: string;
	subject: string;
	templateId: string;
	params: Record<string, any>;
}
