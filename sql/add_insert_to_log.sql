drop trigger "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.sql/add_insert_to_log";
CREATE TRIGGER "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.sql/add_insert_to_log"
    AFTER INSERT ON 
         "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.Products" 
    REFERENCING NEW ROW newrow FOR EACH ROW
 BEGIN

  INSERT INTO "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.productLog" 
           VALUES(:newrow.PRODUCTID, 
                 (select IFNULL(MAX(logid), 0) + 1 
                    from "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.productLog" 
                      where productid = :newrow.PRODUCTID),
                  now(), 
                  CURRENT_USER,
                  :newrow.PRODUCTID || ' has been created');
 END;
 
 INSERT into "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.Products" 
          values( 'ProductA', 'PR', 'Handheld', '0000000033', '20121003', '0000000033', '20121003',
                  '1000000149', '1000000150', '0100000029', 1, 'EA', 0.5, 'KG', 'CAD', 2490, '/sap/hana/democontent/epmNext/data/images/HT-7030.jpg',
                  0.09, 0.15, 0.1, 'M');

                  

--select PRODUCTID, CATEGORY, PRICE from "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.Products"
--          where PRODUCTID = 'ProductA';
--select * from "SAP_HANA_EPM_NEXT"."sap.hana.democontent.epmNext.data::MD.productLog";
