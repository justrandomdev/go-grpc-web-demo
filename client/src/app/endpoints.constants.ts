export class Endpoints {

    public static EMPTY = '';
    public static REGISTRATION = 'registration/:token';
    public static DASHBOARD = 'dashboard';
    public static OPERATIONS = 'operations'
    public static TRANSAKT = 'transakt';
    public static INTERAKT = 'interakt';
    public static ADMINISTRATION = 'administration';
    public static SLA = 'sla';
    public static ANY = '**';

    public static withSlash(pathConstant: string): string {
      return '/' + pathConstant;
    }
}
