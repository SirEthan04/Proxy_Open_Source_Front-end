export type AlertType = 'LOW_STOCK' | 'EXPIRED';
export type AlertLevel = 'WARNING' | 'CRITICAL';

export class Alert {
  constructor(
    public id: number = 0,
    public productId: number | null = null,
    public lotId: number | null = null,
    public type: AlertType = 'LOW_STOCK',
    public level: AlertLevel = 'WARNING',
    public message: string = '',
    public generatedAt: string = '',
    public attended: boolean = false,
  ) {}
}
